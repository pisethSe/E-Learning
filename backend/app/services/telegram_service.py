TELEGRAM_CHANNEL_USERNAME = "bacii26w"
TELEGRAM_CHANNEL_URL = f"https://t.me/{TELEGRAM_CHANNEL_USERNAME}"


def get_telegram_source():
    return {
        "platform": "telegram",
        "channel_username": TELEGRAM_CHANNEL_USERNAME,
        "channel_url": TELEGRAM_CHANNEL_URL,
    }
