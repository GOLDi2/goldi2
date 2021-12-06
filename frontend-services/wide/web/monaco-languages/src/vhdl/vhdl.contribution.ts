'use strict';

import {registerLanguage} from '../_.contribution';

registerLanguage({
	id: 'vhdl',
	extensions: ['.vhd'],
	aliases: ['Very High Speed Integrated Circuit Hardware Description Language', 'VHDL'],
	loader: () => import('./vhdl')
});
