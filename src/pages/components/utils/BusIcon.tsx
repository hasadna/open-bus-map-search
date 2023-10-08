import { DivIcon } from "leaflet";

export const busIcon = ({ operator_id, name }: { operator_id: string; name?: string }) => {
    const path = `/bus-logos/${operator_id}.svg`
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