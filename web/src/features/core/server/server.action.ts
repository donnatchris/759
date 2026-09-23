import {
  ServerResponse,
  type TServerResponse,
} from '../server/server.response';

type TExecuteActionWithoutInput<T> = {
  actionName: string;
  service: () => Promise<T>;
};

type TExecuteActionWithInput<T> = {
  actionName: string;
  input: unknown;
  service: (input: unknown) => Promise<T>;
};

type TExecuteActionProps<T> =
  | TExecuteActionWithoutInput<T>
  | TExecuteActionWithInput<T>;

export async function executeAction<T>(
  props: TExecuteActionProps<T>,
): Promise<TServerResponse<T>> {
  try {
    if ('input' in props) {
      const res = await props.service(props.input);
      return ServerResponse.success(res);
    }

    const res = await props.service();
    return ServerResponse.success(res);
  } catch (error) {
    console.error(`Error in ${props.actionName}:`, error);
    return ServerResponse.failure(error);
  }
}
