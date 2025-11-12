@element([
    'classList' => [
        'container'
    ],
    'attributeList' => [
        'data-js-search-page-container' => true
    ]
])  
    @element([
        'classList' => [
            'search-panel'
        ],
    ])
        @element([
            'classList' => [
                'search-panel__results',
                'u-display--flex',
                'u-flex--gridgap',
                'u-flex-direction--column',
                'unlist',
            ]
        ])
            @include('partials.searchField')
            @include('partials.refinements')
            @include('partials.noresult')
            @include('partials.stats')
            @include('partials.hits')
            @include('partials.pagination')
        @endelement
    @endelement
    @include('post.card')
@endelement
