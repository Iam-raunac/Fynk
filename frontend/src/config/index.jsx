const { default: axios } = require("axios");




export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fynk.onrender.com/"

export const clientServer = axios.create({
    baseURL: BASE_URL,
})