export function Filter(queryObject) {
  const execQuery = ["page", "limit", "skip", "sort", "search", "select"];
  execQuery.map((element) => {
    delete queryObject[element];
  });

  queryObject = JSON.stringify(queryObject);
  queryObject = queryObject.replace(
    /\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g,
    (match) => `$${match}`
  );
  queryObject = JSON.parse(queryObject);

  return queryObject;
}
