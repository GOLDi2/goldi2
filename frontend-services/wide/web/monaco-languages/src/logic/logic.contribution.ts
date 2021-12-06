'use strict';

import { registerLanguage } from "../_.contribution";

registerLanguage({
	id: 'logic',
	extensions: ['.logic'],
	aliases: ['LogIC'],
	loader: () => import('./logic')
});
