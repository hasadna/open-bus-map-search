import {
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons'
import { Point } from 'src/pages/timeBasedMap'

function MapFooterButtons({index, positions, navigateMarkers}: {index: number, positions: Point[], navigateMarkers: (id: number) => void}){
    const checkIfValidStep = (i: number) => {
        return Boolean(positions.at(i))
    } 

    return <>
        <RightOutlined disabled={!checkIfValidStep(index+1)} onClick={() => navigateMarkers(index+1)} />
        <LeftOutlined disabled={!checkIfValidStep(index-1)} onClick={() => navigateMarkers(index-1)} />
    </>
}

export default MapFooterButtons