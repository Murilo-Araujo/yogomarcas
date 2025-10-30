// See the Tailwind default theme values here:
// https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        './app/controllers/**/*.rb',
        './app/models/**/*.rb',
        './app/helpers/**/*.rb',
        './app/javascript/**/*.js',
        './app/assets/stylesheets/**/*.{scss,sass,css}',
        './app/views/**/*.{erb,haml,html,slim,jbuilder}',
        './config/initializers/heroicon.rb',
        './app/components/**/*.{rb,erb,haml,html,slim}',
        //   locales i18n rails
        './config/locales/**/*.{rb,yml}',
    ],
    theme: {
        container: {
            padding: {
                DEFAULT: '2rem'

            },
        },

        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans]
            },
            ringOffsetWidth: {
                '2': '2px',
                '4': '4px',
                '8': '8px',
            },
            screens: {
                'sm': '640px',
                // => @media (min-width: 640px) { ... }

                'md': '768px',
                // => @media (min-width: 768px) { ... }

                'lg': '1024px',
                // => @media (min-width: 1024px) { ... }

                'xl': '1280px',
                // => @media (min-width: 1280px) { ... }

                '2xl': '1536px',
                // => @media (min-width: 1536px) { ... }

            },
            // Create your own at: https://javisperez.github.io/tailwindcolorshades
            colors: {
                primary: {
                    50:  '#f3f2f7',
                    100: '#e6e5f0',
                    200: '#d3d1e5',
                    300: '#b8b6d8',
                    400: '#938ec8',
                    500: '#6760b7',
                    600: '#4f47a3',
                    700: '#403a88',
                    800: '#322c6d',
                    900: '#242050',
                },
                danger: colors.rose,
                info: colors.blue,
                warning: colors.amber,
                success: colors.emerald,
                secondary: colors.gray,
                "code-400": "#fefcf9",
                "code-600": "#3c455b",
                "document-preview": "#E7E8EB"
            },
            margin: {
                '1px': '1px',
            }
        },
    },
    variants: {
        ...defaultTheme.variants,
        borderWidth: ['responsive', 'last', 'hover', 'focus']
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/line-clamp')
    ]
}
