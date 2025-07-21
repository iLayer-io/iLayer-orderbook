import { Protocols } from '@waku/sdk';
import protobuf, { Type } from 'protobufjs';

export const LIGHT_NODE_CONFIG = {
  options: { defaultBootstrap: true },
  protocols: [Protocols.LightPush, Protocols.Filter]
};

export const CONTENT_TOPIC = '/iLayer/1/rfq/proto';

export const getRequestType = (): Type => {
  const RequestToken = new protobuf.Type('RequestToken')
    .add(new protobuf.Field('address', 1, 'string'))
    .add(new protobuf.Field('weight', 2, 'int32'));

  const RequestFrom = new protobuf.Type('RequestFrom')
    .add(new protobuf.Field('network', 1, 'string'))
    .add(new protobuf.Field('tokens', 2, 'RequestToken', 'repeated'));

  const RequestTo = new protobuf.Type('RequestTo')
    .add(new protobuf.Field('network', 1, 'string'))
    .add(new protobuf.Field('tokens', 2, 'RequestToken', 'repeated'));

  const Request = new protobuf.Type('Request')
    .add(new protobuf.Field('bucket', 1, 'string'))
    .add(new protobuf.Field('from', 2, 'RequestFrom'))
    .add(new protobuf.Field('to', 3, 'RequestTo'));

  new protobuf.Root()
    .define('WakuPackage')
    .add(RequestToken)
    .add(RequestFrom)
    .add(RequestTo)
    .add(Request);

  return Request;
};

export const getResponseType = (): Type => {
  const ResponseToken = new protobuf.Type('ResponseToken')
    .add(new protobuf.Field('address', 1, 'string'))
    .add(new protobuf.Field('amount', 2, 'int32'));

  const ResponseFrom = new protobuf.Type('ResponseFrom')
    .add(new protobuf.Field('network', 1, 'string'))
    .add(new protobuf.Field('tokens', 2, 'ResponseToken', 'repeated'));

  const ResponseTo = new protobuf.Type('ResponseTo')
    .add(new protobuf.Field('network', 1, 'string'))
    .add(new protobuf.Field('tokens', 2, 'ResponseToken', 'repeated'));

  const Response = new protobuf.Type('Response')
    .add(new protobuf.Field('solver', 1, 'string'))
    .add(new protobuf.Field('from', 2, 'ResponseFrom'))
    .add(new protobuf.Field('to', 3, 'ResponseTo'));

  new protobuf.Root()
    .define('WakuPackage')
    .add(ResponseToken)
    .add(ResponseFrom)
    .add(ResponseTo)
    .add(Response);

  return Response;
};
