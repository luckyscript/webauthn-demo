CREATE TABLE `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` datetime NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP,
  `gmt_modified` datetime NOT NULL COMMENT '修改时间' DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(200) NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET=utf8mb4 COMMENT='用户';


CREATE TABLE `authenticator` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `gmt_create` datetime NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP,
  `gmt_modified` datetime NOT NULL COMMENT '修改时间' DEFAULT CURRENT_TIMESTAMP,
  `user_id` bigint unsigned NOT NULL COMMENT '用户id',
  `cred_id` varchar(128) NOT NULL COMMENT '凭证id',
  `public_key` varchar(500) NOT NULL COMMENT '公钥',
  `type` varchar(20) NOT NULL COMMENT '凭证类型',
  `transports` varchar(200) NOT NULL COMMENT '传输方式',
  `counter` int unsigned NOT NULL COMMENT '计数器',
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET=utf8mb4 COMMENT='passkey';