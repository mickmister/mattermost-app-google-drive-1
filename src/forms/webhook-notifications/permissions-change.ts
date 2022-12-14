import {AppBindingLocations} from '../../constant/apps';
import manifest from '../../manifest.json';
import {GA$DriveActivity, Schema$File, Schema$User, User, WebhookRequest} from '../../types';
import {h5, hyperlink, inLineImage} from '../../utils/markdown';
import {postBotChannel} from '../../utils/post-in-channel';
import {configureI18n} from '../../utils/translations';

import {getMattermostUsername} from './get-mm-username';

export async function permissionsChanged(call: WebhookRequest, file: Schema$File, activity: GA$DriveActivity): Promise<void> {
    const i18nObj = configureI18n(call.context);

    const author = file.sharingUser as Schema$User;
    const actorEmail = <string>author.emailAddress;
    let userDisplay = `${author?.displayName} (${actorEmail})`;
    const mmUser = await getMattermostUsername(call, actorEmail) as User;

    if (Boolean(mmUser)) {
        userDisplay = `@${mmUser.username}`;
    }

    const message = h5(i18nObj.__('permission-change.message', {userDisplay}));
    const description = `${inLineImage(i18nObj.__('comments.file-icon'), `${file?.iconLink} =15x15`)} ${hyperlink(`${file?.name}`, `${file?.webViewLink}`)}`;

    const props = {
        app_bindings: [
            {
                location: AppBindingLocations.EMBEDDED,
                app_id: manifest.app_id,
                description,
            },
        ],
    };
    await postBotChannel(call, message, props);
}
