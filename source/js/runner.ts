import {
  HtmlEventService,
  HtmlRenderService,
  SearchService,
  GenericSearchQueryParams,
  HtmlRunnerService,
  GenericSearchResult,
} from './types'
import { setUrlSearchParam } from './url-param'

export const Runner = (
  binder: HtmlEventService,
  adapter: SearchService,
  html: HtmlRenderService
): HtmlRunnerService & { html: HtmlRenderService } => {

  const exec = (params: GenericSearchQueryParams): Promise<GenericSearchResult> => {
    return adapter.search(params).then(result => {
      setUrlSearchParam(params.query)
      html.reset()
      html.renderStats(result)
      html.renderItems(result)
      html.renderPagination(result)
      html.renderFacets(result, params.post_type_name || [], (selected) => {
        params.post_type_name = selected
        exec(params)
      })
      binder.registerPagination(html.getPaginationContainer(), (page: number) => {
        exec({ ...params, page })
      })

      return result
    })
  }

  binder.registerSearchBox(html.getInputField(), exec)

  return { exec, html }
}

