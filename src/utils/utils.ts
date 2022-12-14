import GeneralConstants from '../constant/general';
import {AppActingUser, AppCallRequest, AppCallResponse, KVGoogleData, KVStoreOptions, Oauth2App, Oauth2CurrentUser} from '../types';
import {ExceptionType, KVStoreGoogleData} from '../constant';

import config from '../config';

import {KVStoreClient} from '../clients/kvstore';

import {Exception} from './exception';
import {newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown} from './call-responses';

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function isConfigured(oauth2: any): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: AppActingUser): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export async function existsOauth2AppConfig(oauth2App: Oauth2App): Promise<boolean> {
    return Boolean(oauth2App.client_id) && Boolean(oauth2App.client_secret);
}

export function isConnected(oauth2user: Oauth2App): boolean {
    return Boolean(oauth2user?.user?.refresh_token);
}

export function errorDataMessage(error: Exception | Error | any): string {
    const errorMessage: string = error?.data?.message || error?.response?.data?.message || error?.message || error;
    return `${errorMessage}`;
}

export function tryPromise<T>(p: Promise<any>, exceptionType: ExceptionType, message: string) {
    return p.
        then((response) => {
            return <T>response.data;
        }).
        catch((error) => {
            const errorMessage: string = errorDataMessage(error);
            throw new Exception(exceptionType, `${message} ${errorMessage}`);
        });
}

export function throwException(exceptionType: ExceptionType, message: string) {
    throw new Exception(exceptionType, `${message}`);
}

export function showMessageToMattermost(exception: Exception | Error): AppCallResponse {
    if (!(exception instanceof Exception)) {
        return newErrorCallResponseWithMessage(exception.message);
    }

    switch (exception.type) {
    case ExceptionType.TEXT_ERROR: return newErrorCallResponseWithMessage(exception.message);
    case ExceptionType.MARKDOWN: return newOKCallResponseWithMarkdown(exception.message);
    default: return newErrorCallResponseWithMessage(exception.message);
    }
}

export function getHTTPPath(): string {
    const host: string = config.APP.HOST;
    const ip: string = host.replace(/^(http:\/\/|https:\/\/|)/g, '');

    if ((/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).test(ip)) {
        return `${config.APP.HOST}:${config.APP.PORT}`;
    }

    return config.APP.HOST;
}

export async function getKVGoogleData(call: AppCallRequest): Promise<KVGoogleData> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(kvOptions);
    const googleData: KVGoogleData = await kvStoreClient.kvGet(KVStoreGoogleData.GOOGLE_DATA);
    return googleData;
}