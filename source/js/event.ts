import type { HtmlEventService, SearchConfig } from './types'

/**
 * Factory for binding events to HTML elements
 * @param param0 Configuration values for the search service
 * @param param0.searchAsYouType Whether to trigger search on every input change
 * @returns A service that manages event binding
 */
export const HtmlEventFactory = ({
  searchAsYouType,
}: SearchConfig): HtmlEventService => ({
  /**
   * Binds events related to search input
   * @param element A reference to the search input element
   * @param callback Callback on event triggered
   */
  registerSearchBox: (element, callback) => {
    // Callback on input
    if (searchAsYouType) {
      element?.addEventListener('input', ({ target }) => {
        window.facetList = {} // Reset global posttypes on new search
        console.log('Resetting global facetList variable')
        callback({ query: (target as HTMLInputElement).value })
      })
      return
    }
    // Callback on enter key press
    element?.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        callback({ query: (event.target as HTMLInputElement)?.value })
      }
    })
    // Callback on empty field
    element?.addEventListener('input', ({ target }) => {
      const value = (target as HTMLInputElement)?.value

      if (value === '') {
        callback({ query: value })
      }
    })
  },
  /**
   * Binds events related to pagination
   * @param element A reference to the pagination container element
   * @param callback Callback on event triggered
   */
  registerPagination: (element, callback) => {
    ;[...element.querySelectorAll<HTMLAnchorElement>('a')].forEach(element => {
      element.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault()
        const target = event.currentTarget as HTMLElement

        callback(Number(target?.dataset?.value ?? '1'))
        window.scrollTo(0, 0)
      })
    })
  },
})
