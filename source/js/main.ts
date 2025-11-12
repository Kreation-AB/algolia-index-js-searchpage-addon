import { HtmlEventFactory } from './event'
import { HtmlRenderFactory } from './html'
import { Runner } from './runner'
import { SearchFactory } from './search'
import { SearchConfig, GenericSearchQueryParams, GenericSearchResult } from './types'

// PHP Provided configuration
declare const searchConfig: SearchConfig
declare const searchParams: GenericSearchQueryParams

let facetCounts: Record<string, number> = {}

document.addEventListener('DOMContentLoaded', function () {
  const runner = Runner(
    HtmlEventFactory(searchConfig),
    SearchFactory(searchConfig),
    HtmlRenderFactory(searchParams),
  )

  const updateFacets = (result: GenericSearchResult) => {
    runner.html.renderFacets(
      result,
      searchParams.post_type_name || [],
      (selected) => {
        searchParams.post_type_name = selected
        runner.exec(searchParams)
      }
    )
  }
  

  // Wrap exec för facet-uppdatering
  const originalExec = runner.exec
  runner.exec = (params: GenericSearchQueryParams) => {
    return originalExec(params).then((result: GenericSearchResult) => {
      updateFacets(result)
      return result
    })
  }

  runner.exec(searchParams)
})


