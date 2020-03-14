const backendUrl = 'http://localhost:8080';

export default class AjaxModule {
    static get(path) {
        // const url = `${backendUrl}${path}`;
        // return fetch(url, {
        //     method: 'GET',
        //     credentials: 'include',
        //     mode: 'cors',
        //     body: null
        // }).then((response) => response.json());

        // мок
        const data = {
            // data: {
            //     'id': 123,
            //     'surname': 'Ivanov',
            //     'name': 'Michael',
            //     'email': 'test@test.com',
            //     'avatar': '/upload/michael-ivanov-avatar.jpg'
            // },
            data: null
        };
        return data;
    }

    static post(path = '/', body, contentType = null) {
        const url = `${backendUrl}${path}`;
        const options = {
            method: 'POST',
            mode: 'cors',
            credentials: 'include'
        };
        if (body) {
            if (contentType === null) {
                options.headers = { 'Content-Type': 'application/json; charset=utf-8' };
                options.body = JSON.stringify(body);
            } else {
                // options.headers = { 'Content-Type': 'multipart/form-data' };
                options.body = body;
            }
        }

        return fetch(url, options).then((response) => response.json());
    }
}
