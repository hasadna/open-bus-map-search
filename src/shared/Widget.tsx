import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const Widget = (props: { children: React.ReactNode }) => {
  return (
    <Card>
      <CardContent>{props.children} </CardContent>
    </Card>
  )
}

export default Widget
