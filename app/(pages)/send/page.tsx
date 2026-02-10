"use client"

const page = () => {
    async function send() {
        const res = await fetch("/api/sendnotification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: "dqlKh5UkxcSNyQLAHlpKVA:APA91bGXzkpT6iG9zkEDetdxhvh-eeni6ad3dFJoC26rGXJJgqR7koy0MyLZxoYTj5D8CkoNldukIeisJOUPXKWlAiELBMcdJGNIn1h8gwHKpAabRaYBJSc"
            })
        })
        const data = await res.json()

        console.log(data)
    }
    return (
        <div>
            <button onClick={send}>Send Notification</button>
        </div>
    )
}

export default page