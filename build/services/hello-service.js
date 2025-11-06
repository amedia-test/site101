import { extendedLogger } from '../logger.js';
const DEFAULT_I18N = {
    NB_NO: { hello: 'Hei' },
    EN_US: { hello: 'Hello' },
};
/**
 * Creates a hello service that can greet users in different languages
 */
export function createHelloService(i18n = DEFAULT_I18N) {
    /**
     * Greets a user in the specified language
     */
    function hello(name, lang = 'NB_NO') {
        if (!name) {
            throw Error('Name is required');
        }
        if (!i18n[lang]) {
            throw Error('Language not supported');
        }
        extendedLogger().info(`Saying hello to ${name} in ${lang}`);
        return `${i18n[lang].hello} ${name}!`;
    }
    return {
        hello,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVsbG8tc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9oZWxsby1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFVOUMsTUFBTSxZQUFZLEdBQWU7SUFDL0IsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtJQUN2QixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO0NBQzFCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxPQUFtQixZQUFZO0lBQ2hFOztPQUVHO0lBQ0gsU0FBUyxLQUFLLENBQUMsSUFBWSxFQUFFLElBQUksR0FBRyxPQUFPO1FBQ3pDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNWLE1BQU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNoQixNQUFNLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFDRCxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLElBQUksT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVELE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxPQUFPO1FBQ0wsS0FBSztLQUNOLENBQUM7QUFDSixDQUFDIn0=