import { PaginationFactory } from './pagination'
import {
  HtmlRenderService,
  GenericSearchResultItem,
  GenericSearchResult,
  GenericSearchQueryParams,
} from './types'

const getHtmlTemplates = (): string[] =>
  [
    'template[data-js-search-hit-template]',
    'template[data-js-search-hit-noimage-template]',
    'template[data-js-search-page-no-results]',
    'template[data-js-search-page-stats]',
    'template[data-js-search-page-pagination-item]',
    'template[data-js-search-page-pagination-icon]',
  ].map(selector => document.querySelector(selector)?.innerHTML ?? '')

const getHtmlElements = (): HTMLElement[] =>
  [
    '[data-js-search-page-search-input]',
    '[data-js-search-page-hits]',
    '[data-js-search-page-pagination]',
  ].map(selector => document.querySelector(selector) || document.createElement('div'))

export const HtmlRenderFactory = (params: GenericSearchQueryParams): HtmlRenderService => {
  const [
    templateHitHtml = '',
    templateNoImgHtml = '',
    templateNoResults = '',
    templateStats = '',
    templatePaginationItem = '',
    templatePaginationIcon = '',
  ] = getHtmlTemplates()

  const [searchInput, searchContainer, searchPagination] =
    getHtmlElements() as [HTMLInputElement, HTMLElement, HTMLElement]

  const append = (parent: Element, content: string): void =>
    parent.insertAdjacentHTML('beforeend', content)

  const translateHit = (item: GenericSearchResultItem): string =>
    (item.image ? templateHitHtml : templateNoImgHtml)
      .replaceAll('{SEARCH_JS_HIT_HEADING}', item.title)
      .replaceAll('{SEARCH_JS_HIT_SUBHEADING}', item.subtitle)
      .replaceAll('{SEARCH_JS_HIT_EXCERPT}', item.summary)
      .replaceAll('{SEARCH_JS_HIT_IMAGE_URL}', item.image ?? '')
      .replaceAll('{SEARCH_JS_HIT_IMAGE_ALT}', item.altText)
      .replaceAll('{SEARCH_JS_HIT_LINK}', item.url)

  const translateNoResults = (): string => templateNoResults
  const translateStats = ({ totalHits, query }: GenericSearchResult): string =>
    templateStats
      .replaceAll('{ALGOLIA_JS_STATS_COUNT}', String(totalHits))
      .replaceAll('{ALGOLIA_JS_STATS_QUERY}', query)

  const translatePaginationItem = (text: string, color: string, className: string): string =>
    templatePaginationItem
      .replaceAll('{ALGOLIA_JS_PAGINATION_TEXT}', text)
      .replaceAll('{ALGOLIA_JS_PAGINATION_HREF}', '#')
      .replaceAll('{ALGOLIA_JS_PAGINATION_COLOR}', color)
      .replaceAll('{ALGOLIA_JS_PAGINATION_CLASS}', className)
      .replaceAll('{ALGOLIA_JS_PAGINATION_PAGE_NUMBER}', text)

  const translatePaginationIcon = (page: string, icon: string): string =>
    templatePaginationIcon
      .replaceAll('{ALGOLIA_JS_PAGINATION_ICON}', icon)
      .replaceAll('{ALGOLIA_JS_PAGINATION_HREF}', '#')
      .replaceAll('{ALGOLIA_JS_PAGINATION_PAGE_NUMBER}', page)

  searchInput.value = params.query || ''

  const renderPostTypeFacetButtons = (
    facets: Record<string, number>,
    selected: string[],
    onChange: (selected: string[]) => void
  ) => {
    const container = document.querySelector('#search-refinements')!
    let facetList = window.facetList || {};
    container.innerHTML = ''
   
    //Loop through facets to build global facetList with counts
    Object.keys(facetList).forEach(pt => {
        const isActive = selected.includes(pt)
        const count = facetList[pt] || 0;
        let li = document.createElement('li');
        li.className = 'ais-RefinementList-item'
        if (isActive) {
            li.classList.add('ais-RefinementList-item--selected')
        }
        let a = document.createElement('a');
        a.href = '#';
        a.innerHTML = `${pt} <span class="badge">${count}</span>`;
        let div = document.createElement('div');
        div.appendChild(a);
        li.appendChild(div);
        a.addEventListener('click', () => {
            const newSelected = isActive ? selected.filter(t => t !== pt) : [...selected, pt]
            onChange(newSelected)
        })
        container.appendChild(li)
    });
  }

  return {
    getInputField: () => searchInput,
    getPaginationContainer: () => searchPagination,
    reset: () => {
      searchContainer.innerHTML = ''
      searchPagination.innerHTML = ''
    },
    renderStats: (result) => append(searchContainer, translateStats(result)),
    renderItems: (result) => {
      if (result.hits.length > 0) {
        result.hits.forEach(hit => append(searchContainer, translateHit(hit)))
      } else {
        append(searchContainer, translateNoResults())
      }
    },
    renderPagination: (result) => {
      const service = PaginationFactory(result)
      if (!service.isFirstPage()) {
        append(searchPagination, translatePaginationIcon(String(result.currentPage - 1), 'keyboard_arrow_left'))
      }
      service.getVisibleItems().forEach(id => {
        const [color, className] = id === result.currentPage ? ['primary', 'c-pagination--is-active'] : ['default', '']
        append(searchPagination, translatePaginationItem(String(id), color, className))
      })
      if (!service.isLastPage()) {
        append(searchPagination, translatePaginationIcon(String(result.currentPage + 1), 'keyboard_arrow_right'))
      }
    },
    renderFacets: (result: GenericSearchResult, selected: string[], onChange: (selected: string[]) => void) => {
        renderPostTypeFacetButtons(result.facets.post_type_name, selected, onChange)
    },
  }
}
