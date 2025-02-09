import axios from "axios"

async function main() {

    const client = new axios.create({
        baseURL: 'https://api.pokemontcg.io/v2',
        headers: {
            "X-API-KEY": process.env.API_KEY
        }
    })

    const pack = await client.get("/sets/sv2")
    const data = await client.get("/cards/sv2-279")
    console.log(data.data)
}

main()