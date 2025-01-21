import { liteClient } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { connectSearchBox, connectPagination, connectStats } from 'instantsearch.js/es/connectors'; 
import { hits, configure, refinementList} from 'instantsearch.js/es/widgets';

document.addEventListener('DOMContentLoaded', function() {
  const searchClient = liteClient(
    algoliaSearchData.applicationId,
    algoliaSearchData.publicApiKey,
    {...algoliaSearchData.clientConfig}
  );

  const search = instantsearch({
    indexName: algoliaSearchData.indexName,
    searchClient,
  });

  function spinner (state) {
    const content = document.querySelector("#hits");
    if(state===true) {
      return content.innerHTML = algoliaSearchComponents["loader"].html;
    } else {
      return;
    }
  }

  function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  /* Searchbox */
  const renderSearchBox = (renderOptions, isFirstRender) => {
    const { query, refine, clear, isSearchStalled, widgetParams: { searchAsYouType = true } = {} } = renderOptions;
    if (isFirstRender) {
      const searchInput = document.getElementById('input_searchboxfield');
      searchInput.value = algoliaSearchData.searchQuery;
      refine(algoliaSearchData.searchQuery);
      if (searchAsYouType) {
        searchInput.addEventListener('input', event => {
          refine(event.target.value);
        });
      } else {
        // Detect Enter key press
        searchInput.addEventListener('keypress', (event) =>  {
          if (event.key === 'Enter') {
            refine(event.target.value);
          }
        });
        // Detect clear action (when input value changes to empty)
        searchInput.addEventListener('input', (event) => {
          if (event.target.value === '') {
            refine(event.target.value);
          }
        });
      }
    }
  };
  const customSearchBox = connectSearchBox(
    renderSearchBox
  );

  search.addWidgets([
    customSearchBox({
      container: document.querySelector('#searchbox'),
      queryHook(query, search) {
        //Update url
        var url = new URL(window.location);
        url.searchParams.has('s') ? url.searchParams.set(
          's', query
        ) : url.searchParams.append(
          's', query
        );
        url.search = url.searchParams;
        url = url.toString();
        history.pushState({}, null, url);

        //Do search
        search(query);
      },
      searchAsYouType: Boolean(algoliaSearchData.searchAsYouType),

    }),

  ]);
  /* End searchbox */ 


  /* Stats */
  // Create the render function
  const renderStats = (renderOptions, isFirstRender) => {
    const {
      nbHits,
      areHitsSorted,
      nbSortedHits,
      processingTimeMS,
      query,
      widgetParams,
    } = renderOptions;

    if (isFirstRender) {
      return;
    }

    let queryContent = "";
    if (query) {
      queryContent = '<q>' + query + '</q>';
    } 
    if (nbHits !== 0) {
      widgetParams.container.innerHTML = algoliaSearchComponents['stats-count'].html.replaceAll('{ALGOLIA_JS_STATS_COUNT}', '<b>' + nbHits + '</b>').replaceAll('{ALGOLIA_JS_STATS_QUERY}', queryContent).replaceAll('{ALGOLIA_JS_STATS_TIME}', processingTimeMS);

    } else {
      widgetParams.container.innerHTML = "";
    }


  };

  // Create the custom widget
  const customStats = connectStats(renderStats);

  // Instantiate the custom widget
  search.addWidgets([
    customStats({
      container: document.querySelector('#stats'),
    })
  ]);

    search.addWidget(
        refinementList({
            container: "#filters",
            attribute: "post_type_name",
            sortBy: ['count:desc', 'name:asc'],
            autoHideContainer: false,
            templates: { 
                item(item, { html }) {
                    const { url, label, count, isRefined } = item;
                    return html`
                        <li><a href="${url}">${label} <span class="badge">${count}</span></a></li>
                        `;
                },
           }
        })
    );

    /* End Stats */

  /* Pagination */
  // Create the render function
  const renderPagination = (renderOptions, isFirstRender) => {
    const {
      pages,
      currentRefinement,
      nbPages,
      isFirstPage,
      isLastPage,
      refine,
      createURL,
    } = renderOptions;

    const container = document.querySelector('#pagination');
    let paginationHtml = algoliaSearchComponents["pagination-item"].html;
    let paginationIcon = algoliaSearchComponents["pagination-item-icon"].html;
    let from = currentRefinement < 2 || pages.length < 5 ? 0 : 1;
    
      container.innerHTML = `
        ${!isFirstPage
        ? 
        paginationIcon
          .replaceAll("{ALGOLIA_JS_PAGINATION_ICON}", "keyboard_arrow_left")
          .replaceAll("{ALGOLIA_JS_PAGINATION_HREF}", createURL(currentRefinement - 1))
          .replaceAll("{ALGOLIA_JS_PAGINATION_PAGE_NUMBER}", currentRefinement - 1)

        : ''
      }  
        ${pages.splice(from, 4)
        .map(
          page => paginationHtml
            .replaceAll("{ALGOLIA_JS_PAGINATION_TEXT}", page + 1)
            .replaceAll("{ALGOLIA_JS_PAGINATION_HREF}", createURL(page))
            .replaceAll("{ALGOLIA_JS_PAGINATION_COLOR}", currentRefinement === page ? 'primary' : 'default')
            .replaceAll("{ALGOLIA_JS_PAGINATION_CLASS}", currentRefinement === page ? 'c-pagination--is-active' : '')
            .replaceAll("{ALGOLIA_JS_PAGINATION_PAGE_NUMBER}", page)
        )
        .join('')}
          ${!isLastPage
        ? 
        paginationIcon
          .replaceAll("{ALGOLIA_JS_PAGINATION_ICON}", 'keyboard_arrow_right')
          .replaceAll("{ALGOLIA_JS_PAGINATION_HREF}", createURL(currentRefinement + 1))
          .replaceAll("{ALGOLIA_JS_PAGINATION_PAGE_NUMBER}", currentRefinement + 1) 
        : ''
      }
    ` ; 

    [...container.querySelectorAll('a')].forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        refine(event.currentTarget.dataset.value);
        window.scrollTo(0,0);
      });
    });
  };

  // Create the custom widget
  const customPagination = connectPagination(
    renderPagination
  );

  // Instantiate the custom widget
  search.addWidgets([
    customPagination({
      container: document.querySelector('#pagination'),
      padding: 2,
      //totalPages: 4,
    }),
  ]);

  /* end pagination */
  search.addWidgets([
    hits({
      container: '#hits',
      cssClasses: {
        root: '',
        list: [
          'unlist',
          'u-display--flex',
          'u-flex--gridgap',
          'u-flex-direction--column'
        ],
      },
      templates: {
        empty(results) {
          return algoliaSearchComponents["noresult"].html.replaceAll(
            "{ALGOLIA_JS_SEARCH_QUERY}",
            results.query
          );
        },
        item(hit) {
          let htmlString = (hit.thumbnail ? 
            algoliaSearchComponents["hit"].html : algoliaSearchComponents["hit-noimg"].html
          ); 

          return htmlString
          .replaceAll("{ALGOLIA_JS_HIT_HEADING}", decodeHtml(hit._highlightResult['post_title'].value))
          .replaceAll("{ALGOLIA_JS_HIT_SUBHEADING}", hit.origin_site)
          .replaceAll("{ALGOLIA_JS_HIT_EXCERPT}", decodeHtml(hit._highlightResult['post_excerpt'].value))
          .replaceAll("{ALGOLIA_JS_HIT_IMAGE_URL}", hit.thumbnail.replaceAll("/wp/", "/"))
          .replaceAll("{ALGOLIA_JS_HIT_IMAGE_ALT}", hit.thumbnail_alt ?? '')
          .replaceAll("{ALGOLIA_JS_HIT_LINK}", hit.permalink);
        }
      },
      escapeHTML: false
    }),
    configure({
      hitsPerPage: 20,
    }), 

  ]);

search.start();
spinner(true);

});

