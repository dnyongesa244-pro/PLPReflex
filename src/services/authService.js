const API_URL = 'http://localhost:5000/api'

const getToken = () => {
    return localStorage.getItem('reflex_token')
}

async function login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Login failed')
    }

    return data
}

async function getCurrentUser() {
    const token = getToken()

    const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Unable to restore session')
    }

    return data
}

export default {
    login,
    getCurrentUser,
}