import { liteClient } from 'algoliasearch/lite'
import type {
  SearchConfig,
  GenericSearchQueryParams,
  GenericSearchResult,
  SearchService,
  GenericSearchResultItem,
  WPPost,
} from './types'
import { decodeHtml } from './mappers'

interface AlgoliaSearchResultItem extends WPPost {
  _highlightResult?: {
    post_title?: { value: string }
    post_excerpt?: { value: string }
  }
}

type AlgoliaHighlightField = 'post_title' | 'post_excerpt'

export interface AlgoliaNativeQueryParams {
  hitsPerPage?: number
  page?: number
  query?: string
  filters?: string
  facetFilters?: string[][]
  facets?: string[]
}

export const algoliaDataTransform = (
  response: AlgoliaSearchResultItem[]
): GenericSearchResultItem[] => {
  const getHighlightValue = (
    item: AlgoliaSearchResultItem,
    name: AlgoliaHighlightField
  ): string => {
    if (item._highlightResult && item._highlightResult[name]) {
      return decodeHtml(item._highlightResult[name].value)
    }
    return item[name] || ''
  }
  return response.map(item => ({
    title: getHighlightValue(item, 'post_title'),
    summary: getHighlightValue(item, 'post_excerpt'),
    subtitle: item.origin_site || '',
    image: item.thumbnail?.replaceAll('/wp/', '/'),
    altText: item.thumbnail_alt || '',
    url: item.permalink || '',
  }))
}

export const algoliaParamTransform = (
  params: GenericSearchQueryParams
): AlgoliaNativeQueryParams => {
  const filters: string[] = []
  const facetFilters: string[][] = []

  if (params.category) filters.push(`category:"${params.category}"`)
  if (params.post_type_name && params.post_type_name.length > 0) {
    facetFilters.push(params.post_type_name.map(type => `post_type_name:${type}`))
  }

  return {
    hitsPerPage: params?.page_size ?? 20,
    page: params.page ? params.page - 1 : undefined,
    query: params.query,
    filters: filters.length ? filters.join(' AND ') : undefined,
    facetFilters: facetFilters.length ? facetFilters : undefined,
    facets: ['post_type_name'],
  }
}

export const AlgoliaAdapter = (config: SearchConfig): SearchService => {
  const searchClient = liteClient(config.applicationId, config.apiKey)

  return {
    search: async (params: GenericSearchQueryParams): Promise<GenericSearchResult> => {
      const { results } = await searchClient.searchForHits<AlgoliaSearchResultItem>({
        requests: [
          {
            indexName: config.collectionName,
            ...algoliaParamTransform(params),
          },
        ],
      })
      
      if (Object.keys(window.facetList || {}).length === 0 && results[0]?.facets?.post_type_name) {
            console.log(window.facetList)
            console.log('Setting global facetList variable')
            window.facetList = results[0].facets.post_type_name
      }

      return {
        query: params.query ?? '',
        totalHits: results[0]?.nbHits ?? 0,
        currentPage: results[0]?.page ? results[0]?.page + 1 : 1,
        totalPages: results[0]?.nbPages ?? 1,
        hits: algoliaDataTransform(results[0]?.hits ?? []),
        facets: results[0]?.facets ?? {},
      }
    },
  }
}

