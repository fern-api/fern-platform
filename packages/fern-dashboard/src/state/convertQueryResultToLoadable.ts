import { UseQueryResult } from "@tanstack/react-query";

import {
  Loadable,
  failed,
  loaded,
  loading,
  notStartedLoading,
} from "@fern-ui/loadable";

export function convertQueryResultToLoadable<T, E = Error>(
  queryResult: UseQueryResult<T, E>
): Loadable<T, E> {
  if (queryResult.isSuccess) {
    return loaded(queryResult.data);
  }
  if (queryResult.isError) {
    return failed(queryResult.error);
  }
  if (queryResult.isFetching) {
    return loading();
  }
  return notStartedLoading();
}
