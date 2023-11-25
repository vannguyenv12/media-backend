import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, header, message } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf-8'), {
      username,
      header,
      message,
      image_url: 'https://png.pngtree.com/png-vector/20190115/ourmid/pngtree-vector-lock-icon-png-image_318067.jpg'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
