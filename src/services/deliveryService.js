const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('reflex_token')

const request = async (endpoint, options = {}) => {
    const token = getToken()

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
    }

    return data
}

export const createDelivery = async (deliveryData) => {
    return request('/deliveries', {
        method: 'POST',
        body: JSON.stringify(deliveryData),
    })
}

export const getRetailerDeliveries = async () => {
    return request('/deliveries/mine')
}

export const getPendingDeliveries = async () => {
    return request('/deliveries/pending')
}

export const getAssignedDeliveries = async () => {
    return request('/deliveries/assigned')
}

export const getRiders = async () => {
    return request('/riders')
}

export const assignRider = async (deliveryId, riderId) => {
    return request(`/deliveries/${deliveryId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ riderId }),
    })
}

export const updateDeliveryStatus = async (deliveryId, status) => {
    return request(`/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    })
}

export const confirmDelivery = async (deliveryId, confirmationCode) => {
    return request(`/deliveries/${deliveryId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmationCode }),
    })
}

export const getMyDeliveries = async () => {
    return request('/deliveries/my-deliveries')
}
