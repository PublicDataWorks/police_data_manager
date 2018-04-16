import _ from 'lodash'

const getComponentOnType = (address, desired_types) => {
    const addressComponents = address.address_components

    const componentMatchesAllTypes = (addressComponent) => {
        return desired_types.every(type => addressComponent.types.includes(type))
    }

    return _.find(addressComponents, componentMatchesAllTypes)
}

const parseAddressFromGooglePlaceResult = (address) => {
    const streetNumberComponent = getComponentOnType(address, ['street_number'])
    const streetNumber = streetNumberComponent ? streetNumberComponent.long_name : ''
    const streetNameComponent = getComponentOnType(address, ['route'])
    const streetName = streetNameComponent ? streetNameComponent.short_name : ''
    const streetAddress = `${streetNumber} ${streetName}`.trim()

    const cityComponent = getComponentOnType(address, ['locality', 'political'])
    const city = cityComponent ? cityComponent.long_name : ''

    const stateComponent = getComponentOnType(address, ['administrative_area_level_1', 'political'])
    const state = stateComponent ? stateComponent.short_name : ''

    const zipCodeComponent = getComponentOnType(address, ['postal_code'])
    const zipCode = zipCodeComponent ? zipCodeComponent.short_name : ''

    const countryComponent = getComponentOnType(address, ['country', 'political'])
    const country = countryComponent ? countryComponent.short_name : ''

    let intersection = ''
    if (streetAddress === ''
        && (address.name.includes('&') || address.name.includes('and'))
        && address.name !== city
        && address.name !== state
        && address.name !== country){
        intersection = address.name
    }

    return {
        streetAddress,
        intersection,
        city,
        state,
        zipCode,
        country
    }
}
export default parseAddressFromGooglePlaceResult