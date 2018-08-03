$('.releases-download-list .item a').each((i, item) => {
  const url = new URL(item.href).searchParams.get('u').replace(/\?.*$/, '')
  console.log(url)
})
