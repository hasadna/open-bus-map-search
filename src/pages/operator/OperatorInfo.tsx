import { Typography, Stack } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { operatorList } from './data'
import Widget from 'src/shared/Widget'

export const OperatorInfo = ({ operatorId }: { operatorId?: string }) => {
  const { t, i18n } = useTranslation()

  const operator = useMemo(() => operatorList.find((a) => a.ref === operatorId), [operatorId])

  return (
    <Widget>
      <Stack justifyContent="space-between" flexDirection="row">
        <div>
          <Typography variant="h5">
            {i18n.language === 'he' ? operator?.name : operator?.eng_name}
          </Typography>
          <InfoTable>
            <InfoItem lable={t('operator.ref')} value={operator?.ref} />
            {i18n.language === 'en' && (
              <InfoItem lable={'Hebrew Name'} value={`"${operator?.name}"`} />
            )}
            <InfoItem lable={t('operator.founded')} value={operator?.founded} />
            <InfoItem
              lable={t('operator.area_title')}
              value={operator?.area && t(`operator.area.${operator?.area}`)}
            />
            <InfoItem
              lable={t('operator.type_title')}
              value={operator?.type && t(`operator.type.${operator?.type}`)}
            />
            <InfoItem
              lable={t('operator.website')}
              value={
                operator?.website && (
                  <a dir="ltr" href={operator?.website} target="_blank" rel="noreferrer">
                    {operator?.website}
                  </a>
                )
              }
            />
          </InfoTable>
        </div>
        <img src={`../operators-logos/${operator?.ref}.svg`} height={96} />
      </Stack>
    </Widget>
  )
}
