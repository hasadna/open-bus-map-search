import { Stack } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { InfoItem, InfoTable } from '../components/InfoTable'
import { operatorList } from './data'
import Widget from 'src/shared/Widget'

export const OperatorInfo = ({ operatorId }: { operatorId?: string }) => {
  const { t, i18n } = useTranslation()

  const operator = useMemo(() => operatorList.find((a) => a.ref === operatorId), [operatorId])

  return (
    <Widget title={i18n.language === 'en' ? operator?.eng_name : operator?.name}>
      <Stack justifyContent="space-between" flexDirection="row">
        <InfoTable>
          <InfoItem label={t('operator.ref')} value={operator?.ref} />
          <InfoItem label={t('operator.founded')} value={operator?.founded} />
          <InfoItem
            label={t('operator.area_title')}
            value={operator?.area && t(`operator.area.${operator?.area}`)}
          />
          <InfoItem
            label={t('operator.type_title')}
            value={operator?.type && t(`operator.type.${operator?.type}`)}
          />
          <InfoItem
            label={t('operator.website')}
            value={
              operator?.website && (
                <a dir="ltr" href={operator?.website} target="_blank" rel="noreferrer">
                  {operator?.website}
                </a>
              )
            }
          />
        </InfoTable>
        <img src={`../operators-logos/${operator?.ref}.svg`} height={96} />
      </Stack>
    </Widget>
  )
}
