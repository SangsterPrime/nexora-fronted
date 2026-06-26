import { useCallback, useEffect, useState } from 'react'

function useApiResource(request, { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await request()
      setData(result)
      return result
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    if (!immediate) {
      return
    }

    const timeoutId = setTimeout(() => {
      refetch().catch(() => {})
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [immediate, refetch])

  return { data, loading, error, refetch }
}

export default useApiResource
