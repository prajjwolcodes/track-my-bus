"use client"

const page = () => {
    async function send() {
        const res = await fetch("/api/sendnotification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                token: "dqlKh5UkxcSNyQLAHlpKVA:APA91bHnt1XxDbYZppznL46La1P_-emv5y7-uYB3Wd5OYII_WQzsGmiABGJIqNrik0Uthu1JN_vS0CLD5ORZs80bw2DRDHlBJEC47f9fzv29Gw7H4KC_icw",
                busId: "SCHVIGKM1-BUS-260326-5K",
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