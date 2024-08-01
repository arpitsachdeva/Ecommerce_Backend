const slugify = require("slugify");

async function generateSlug(title, model) {
    let slug = slugify(title, {remove: /[*+~().'"!:@]/g , lower:true} );

    // Check if the slug already exists in the database
    let slugExists = await model.exists({ slug });
    let counter = 1;

    while (slugExists) {
        // Append or increment the number in the slug
        const match = slug.match(/-(\d+)$/); // Check if slug ends with a number
        if (match) {
            // If a number exists, increment it
            slug = slug.replace(/-\d+$/, `-${++counter}`);
        } else {
            // If no number, append one
            slug = `${slug}-${counter}`;
        }

        // Check again if the new slug exists
        slugExists = await model.exists({ slug });
    }

    return slug;
}
module.exports = generateSlug;