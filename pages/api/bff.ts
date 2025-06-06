
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'


// Get data from all services, format the data, so FE can just render the UI
interface User {
    first_name: string
    last_name: string
    address: string
    location: string
    created_at: string
}

interface Message {
    uid: string
    text: string
    created_at: string
    read: boolean
}

// create desired Profile object
export interface Profile {
    name: string // combination ofr firstName + lastName
    location: string
    address: string
    joined: Date
    last_seen: Date
    new_notifications: number
    new_messages: number
    new_friend_requests: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { host } = req.headers
    const api_url = `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${host}`

    let user_data = {} as User

    let messages_data = []
    let notifications_data = []
    let friend_requests_data = []
    let latest_message = {} as Message

    try {
        const response = await axios.get(`${api_url}/api/user`)
        const api_data: any = response.data
        user_data = api_data
    } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }

    try {
        const response = await axios.get(`${api_url}/api/messages`, { params: { action: 'read', read: false } })
        const api_data: any = response.data
        messages_data = api_data
    } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }

    try {
        const response = await axios.get(`${api_url}/api/messages`, { params: { action: 'get_latest' } })
        const api_data: any = response.data
        latest_message = api_data
    } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }

    try {
        const response = await axios.get(`${api_url}/api/notifications`, { params: { action: 'seen', seen: false } })
        const api_data: any = response.data
        notifications_data = api_data
    } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }

    try {
        const response = await axios.get(`https://jobstest-bscmd8cwdre9f9an.westeurope-01.azurewebsites.net/friend-requests`)
        const api_data: any = response.data
        friend_requests_data = api_data
    } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }

    // desired Profile object
    const profile: Profile = {
        name: `${user_data.first_name} ${user_data.last_name}`,
        address: user_data.address,
        location: user_data.location,
        joined: new Date(user_data.created_at),
        last_seen: new Date(parseInt(latest_message.created_at) * 1000),
        new_notifications: notifications_data.length,
        new_messages: messages_data.length,
        new_friend_requests: friend_requests_data.length,
    }

    res.status(200).json(profile)
}
