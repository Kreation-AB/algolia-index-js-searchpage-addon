<div class="container">
  <div class="search-panel">
    <div class="search-panel__results u-display--flex u-flex--gridgap u-flex-direction--column">
      <div id="searchbox">
        @field([
            'id' => 'searchBoxField',
            'type' => 'text',
            'type' => 'search',
            'name' => 'search',
            'required' => true,
            'label' => $lang->searchLabel,
            'icon' => ['icon' => 'search']
        ])
        @endfield
      </div>
      <div id="filters"></div>
      <div id="stats"></div>
      <div id="hits">
        @include('js.object.loader')
      </div>
      <ul class="c-pagination u-margin__x--auto u-margin__bottom--4" id="pagination"></ul>
    </div>
  </div>
</div>
