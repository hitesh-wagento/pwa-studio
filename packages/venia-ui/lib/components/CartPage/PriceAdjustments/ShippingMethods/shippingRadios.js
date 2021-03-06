import React from 'react';
import gql from 'graphql-tag';
import { arrayOf, string, shape, number } from 'prop-types';
import { useShippingRadios } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/ShippingMethods/useShippingRadios';

import { mergeClasses } from '../../../../classify';
import RadioGroup from '../../../RadioGroup';
import { CartPageFragment } from '../../cartPageFragments.gql';
import ShippingRadio from './shippingRadio';
import defaultClasses from './shippingRadios.css';
import { SelectedShippingMethodFragment } from './shippingMethodsFragments';

const ShippingRadios = props => {
    const {
        setIsCartUpdating,
        selectedShippingMethod,
        shippingMethods
    } = props;
    const {
        formattedShippingMethods,
        handleShippingSelection
    } = useShippingRadios({
        setIsCartUpdating,
        selectedShippingMethod,
        shippingMethods,
        mutations: {
            setShippingMethodMutation: SET_SHIPPING_METHOD_MUTATION
        }
    });
    const radioComponents = formattedShippingMethods.map(shippingMethod => {
        return {
            label: (
                <ShippingRadio
                    currency={shippingMethod.amount.currency}
                    name={shippingMethod.method_title}
                    price={shippingMethod.amount.value}
                />
            ),
            value: shippingMethod.serializedValue
        };
    });
    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <RadioGroup
            classes={{
                radio: classes.radio,
                radioLabel: classes.radio_contents,
                root: classes.root
            }}
            field="method"
            initialValue={selectedShippingMethod}
            items={radioComponents}
            onValueChange={handleShippingSelection}
        />
    );
};

export default ShippingRadios;

export const SET_SHIPPING_METHOD_MUTATION = gql`
    mutation SetShippingMethodForEstimate(
        $cartId: String!
        $shippingMethod: ShippingMethodInput!
    ) {
        setShippingMethodsOnCart(
            input: { cart_id: $cartId, shipping_methods: [$shippingMethod] }
        ) {
            cart {
                id
                ...CartPageFragment
                ...SelectedShippingMethodFragment
                # Intentionally do not re-fetch available methods because
                #  a) they are wrong in the mutation response
                #  b) it is expensive to recalculate.
            }
        }
    }
    ${CartPageFragment}
    ${SelectedShippingMethodFragment}
`;

ShippingRadios.propTypes = {
    classes: shape({
        radio: string,
        radio_contents: string,
        root: string
    }),
    selectedShippingMethod: string,
    shippingMethods: arrayOf(
        shape({
            amount: shape({
                currency: string.isRequired,
                value: number.isRequired
            }),
            carrier_code: string.isRequired,
            method_code: string.isRequired,
            method_title: string.isRequired
        })
    )
};
