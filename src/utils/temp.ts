
export const formatDuration = (duration: number): string => {
    const seconds = duration > 20000 ? Math.floor(duration / 1000) : duration
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatBitrate = (bitrate: number): string => {
    const kbps = bitrate > 50000 ? Math.floor(bitrate / 1000) : bitrate
    return kbps.toString()
}
