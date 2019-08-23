import L from 'leaflet';

export const generateIcon = (mark) => {

    const color = mark.status.color
    return L.divIcon({
        className: "marker",
        iconSize:[10, 10],
        html: `<span class="markerWrapper ${color}"></span>`
    })
}