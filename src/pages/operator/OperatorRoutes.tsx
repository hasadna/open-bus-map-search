import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { Skeleton } from 'antd'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import styled from 'styled-components'
import { SearchContext } from 'src/model/pageState'
import Widget from 'src/shared/Widget'
import { useAllRoutes } from '../../hooks/useAllRoutes'

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

  const navigate = useNavigate()

  return (
    <Widget title={t('operator.all_lines')} marginBottom>
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
                      onClick={(e) => {
                        e.preventDefault()
                        setSearch((current) => ({
                          ...current,
                          lineNumber: route.line + route.suffix,
                          routeKey: route.routeKey,
                        }))
                        navigate('/single-line-map')
                      }}
                      to={`/single-line-map`}>
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
