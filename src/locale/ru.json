import { DivIcon } from 'leaflet'

export const busIconPath = (operator_id: string | number) => `/bus-logos/${operator_id}.svg`

export const busIcon = ({ operator_id, name }: { operator_id: string | number; name?: string }) => {
  const path = busIconPath(operator_id)
  return new DivIcon({
    className: 'my-div-icon',
    html: `
      <div class="bus-icon-container">
        <div class="bus-icon-circle">
          <img src="${path}" alt="${name}" />
        </div>
        <div class="operator-name">${name}</div>
      </div>
      `,
  })
}
