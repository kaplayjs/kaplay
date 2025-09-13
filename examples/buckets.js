/**
 * @file Custom Assets
 * @description Use the "custom" asset bucket to load custom data
 * @difficulty 0
 * @tags loading
 * @minver 3001.0
 * @category concepts
 * @group buckets
 * @groupOrder 50
 */

// Let's create a custom asset bucket

/* 💡 Asset Buckets 💡
An Asset Bucket is where assets are stored, different KAPLAY functions like
loadSprite, loadSound or loadFont stores the asset data in different buckets.
You can also use custom buckets.
*/

kaplay();

// Load something into the "custom" bucket.
loadAsset(
    "quote",
    // While this promise is not resolved, loading screen will persists as it means
    // the asset is still loading.
    new Promise(
        // Resolve is when the asset is loaded, reject when the asset get into
        // an error while loading
        (resolve, reject) => {
            fetch("https://dummyjson.com/quotes/1")
                .then(res => res.json())
                .then(data => {
                    resolve(data);
                });
        },
    ),
);

onLoad(() => {
    const quoteData = getAsset("quote").data.quote;

    debug.log(quoteData);
});
