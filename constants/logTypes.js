const logTypes = {
	LOGSTARTCHECK: 'Начало проверки наличия новых заказов',
	LOGNEWORDERS: 'Получены новые заказы из CRM',
	LOGNOTNEW: 'Новых заказов нет',
	LOGWRITENEWDB: 'Запись нового заказа в БД',
	LOGGETALLSTORES: 'Получен список всех складов',
	LOGAPINEWREQ: 'Пришел запрос в API на получение новых заказов для доставки',
	LOGAPIGETALLNEW: 'Новые заказы переданы API тастаматов',
	LOGAPINOTNEW: 'Новых заказов для доставки нет',
	LOGAPIGETINFO: 'API пришел запрос на получение данных заказа',
	LOGAPIINFODONE: 'Данные заказа отправлены',
	LOGAPISETSTATUS: 'API пришел запрос на обновления статуса заказа',
	LOGAPIUPDATEDB: 'Обновление статуса заказа в БД',
	LOGAPIUPDATECRM: 'Обновление статуса заказа в CRM',
	ERRORCHECKCRM: 'Ошибка при запросе в CRM для новых заказов',
	ERRORNEWDB: 'Ошибка при записи нового заказа в БД',
	ERRORALLSTORES: 'Ошибка при запросе в CRM для всех складов',
	ERRORAPINEWORDERS: 'Ошибка при получении новых заказов для доставки из БД',
	ERRORAPIGETINFODB: 'Ошибка при получении данных заказа из БД',
	ERRORAPIUPDATESTATUS: 'Ошибка обновление статуса заказа'
};

module.exports = logTypes;
