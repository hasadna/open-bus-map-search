import { Box, Skeleton, SxProps, Theme } from '@mui/material'

interface SkeletonLoaderProps {
  /** Show the shimmer animation (maps to antd's `active`). Defaults to true. */
  active?: boolean
  /** Render a wider title line above the paragraph rows. Defaults to true. */
  title?: boolean
  /** Number of paragraph rows to render. Defaults to 3 (antd's default). */
  rows?: number
  sx?: SxProps<Theme>
  style?: React.CSSProperties
}

/**
 * MUI-based replacement for antd's <Skeleton />, exposing the small subset of
 * props the codebase relied on. Part of the ant -> mui migration (issue #158).
 */
const SkeletonLoader = ({
  active = true,
  title = true,
  rows = 3,
  sx,
  style,
}: SkeletonLoaderProps) => {
  const animation = active ? 'wave' : false

  return (
    <Box sx={sx} style={style} data-testid="skeleton-loader">
      {title && <Skeleton variant="text" animation={animation} width="38%" sx={{ mb: 1 }} />}
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          animation={animation}
          width={index === rows - 1 ? '61%' : '100%'}
        />
      ))}
    </Box>
  )
}

export default SkeletonLoader
