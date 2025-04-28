import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Skeleton } from 'antd'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import styled from 'styled-components'
import { useAllRoutes } from '../../hooks/useAllRoutes'
import { SearchContext } from 'src/model/pageState'
import Widget from 'src/shared/Widget'

export const OperatorRoutes = ({
  operatorId,
  timestamp,
}: {
  operatorId?: string
  timestamp?: number
}) => {
  const { setSearch } = useContext(SearchContext)
  const { t } = useTranslation()
  const { routes, isLoading } = useAllRoutes(operatorId, timestamp)

  return (
    <Widget marginBottom>
      <Typography
        sx={{ margin: '17.5px 0.5rem', fontWeight: 'bold', fontSize: 24, lineHeight: '35px' }}
        variant="h2">
        {t('operator.all_lines')}
      </Typography>
      <TableContainer sx={{ height: 345 }}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('operator.line')}</TableCell>
                <TableCell>{t('operator.origin')}</TableCell>
                <TableCell>{t('operator.destination')}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{isNaN(route.line) ? '' : route.line + route.suffix}</TableCell>
                  <TableCell>{route.start}</TableCell>
                  <TableCell>{route.end}</TableCell>
                  <TableCell>
                    <Link to={`/profile/${route.id}`}>{t('operator.profile')}</Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      onClick={() => {
                        setSearch((current) => ({
                          ...current,
                          lineNumber: route.line + route.suffix,
                          routeKey: route.routeKey,
                        }))
                      }}
                      to="/single-line-map">
                      {t('operator.map')}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <StyledCaption>{`${t('operator.total')} ${routes.length}`}</StyledCaption>
    </Widget>
  )
}

const StyledCaption = styled.div`
  padding: 16px 16px 0 16px;
  text-align: end;
  font-weight: bold;
  font-size: 0.75rem;
  line-height: 1;
  opacity: 0.6;
`
