import React from 'react'

import Layout from 'src/components/layout'

export default ({location}) => {
    return(
        <Layout title="404" location={location}>
            Not found
        </Layout>
    )
}