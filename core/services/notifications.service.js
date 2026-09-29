

export async function notify({ message }) {
    let url = "https://apidev.gentex.com/it/notification/v1/notifications/groups/ericson_test/subjects/ERICSON_TEST_SUBJECT/events";

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                messageSubject: "Auto IT Dev Update"
            })
        });

        if (!response.ok) {
            console.log("Failed to send notification");
            console.log(await response.json());
        } else {
            console.log("Notification sent");
        }


    } catch (err) {
        console.log("Failed to send notification");
    }
}
