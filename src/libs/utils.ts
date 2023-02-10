export const estimateTime = ({
    since,
    current,
    total
}: {
    since: number
    current: number
    total: number
}) => (((performance.now() - since) / current) * (total - current)) / 1000

export const formatDisplayTime = (time: number) => {
    let seconds = ~~time
    let minutes = 0
    let hours = 0

    while (seconds >= 3600) {
        seconds -= 3600
        hours += 1
    }

    while (seconds >= 60) {
        seconds -= 60
        minutes += 1
    }

    if (hours) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes) return `${minutes}m ${seconds}s`

    return `${seconds}s`
}

export const createProgress = ({
    start,
    end,
    getCurrent
}: {
    start: number
    end: number
    getCurrent: () => number
}) => {
    const since = performance.now()

    const interval = setInterval(async () => {
        const current = getCurrent()
        const percent = ((current / (end - start)) * 100).toFixed(2)

        const timeLeft = formatDisplayTime(
            estimateTime({
                current,
                total: end - start,
                since
            })
        )

        console.log(
            `(${percent}%) | ${current + start}/${end} | Estimate time left: ${timeLeft}`
        )
    }, 10000)

    return () => clearInterval(interval)
}
