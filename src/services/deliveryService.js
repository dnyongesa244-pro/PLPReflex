const API_URL = 'http://localhost:5000/api'

const getToken = () => {
    return localStorage.getItem('reflex_token')
}

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

export const getMyDeliveries = async () => {
    return request('/deliveries/my-deliveries')
}