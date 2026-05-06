import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAboutPage1746000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const body = `Xin chào! Tôi là một lập trình viên với hơn 10 năm kinh nghiệm trong lĩnh vực phát triển web và phần mềm doanh nghiệp. Hành trình của tôi đi qua nhiều công nghệ, thị trường và mô hình kinh doanh khác nhau — từ startup sản phẩm đến outsource cho khách hàng Nhật Bản và châu Âu.

---SECTION---

Web Development (10+ năm)

PHP & Laravel — nền tảng chính trong nhiều năm. Tôi đã xây dựng nhiều hệ thống thương mại điện tử, quản lý nội dung, và API backend với Laravel từ phiên bản 4.x đến hiện tại.

Node.js & NestJS — khi hệ sinh thái JS/TS trưởng thành, tôi chuyển dần sang Node.js cho các dự án real-time, microservices và API-first. Blog này là một ví dụ nhỏ được xây dựng bằng NestJS.

AWS — EC2, RDS, S3, CloudFront, Lambda, SQS là những dịch vụ tôi dùng thường xuyên nhất. Đã triển khai và vận hành nhiều hệ thống production trên AWS cho cả thị trường Nhật và EU.

---SECTION---

SAP ABAP (3 năm)

Ba năm làm việc trong mảng SAP đã cho tôi cái nhìn hoàn toàn khác về phần mềm doanh nghiệp. Lập trình ABAP — ngôn ngữ độc quyền của SAP — đòi hỏi tư duy khác biệt so với web development thông thường: không có framework hiện đại, không có open source ecosystem, nhưng bù lại là tính ổn định và sức mạnh xử lý dữ liệu doanh nghiệp ở quy mô lớn.

Tôi đã tham gia các dự án triển khai SAP ERP cho doanh nghiệp sản xuất và phân phối, làm việc với các module SD, MM, FI và phát triển custom ABAP reports, BAPIs, User Exits và enhancement spots.

---SECTION---

Java & Spring (đang học)

Hiện tại tôi đang học Java với Spring Boot và Spring ecosystem. Sau nhiều năm với PHP và Node.js, Java mang lại trải nghiệm về type safety nghiêm ngặt, JVM ecosystem phong phú và kiến trúc enterprise-grade mà ít ngôn ngữ nào sánh được.

Mục tiêu: nắm vững Spring Boot, Spring Security, JPA/Hibernate và microservices với Spring Cloud để mở rộng phạm vi dự án có thể tham gia.

---SECTION---

Kinh nghiệm dự án

Thương mại điện tử — Tôi đã tham gia xây dựng nhiều hệ thống TMĐT, từ B2C đến B2B, bao gồm quản lý sản phẩm, giỏ hàng, thanh toán, quản lý kho và tích hợp với các bên thứ ba (payment gateways, shipping providers, ERP).

Product — Làm việc trong môi trường sản phẩm cho phép tôi tham gia từ bước thiết kế feature đến deployment và monitoring. Tôi hiểu sự khác biệt giữa "viết code chạy được" và "xây dựng sản phẩm có thể scale".

Outsource — Thị trường Nhật Bản và EU đặt ra tiêu chuẩn rất cao về chất lượng tài liệu, quy trình và giao tiếp. Ba năm làm outsource đã rèn luyện cho tôi kỹ năng viết spec, làm việc với requirement mơ hồ và deliver đúng hạn.`;

    await queryRunner.query(
      `UPDATE pages SET body = ?, title = 'About Me' WHERE slug = 'about'`,
      [body],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE pages SET body = 'Welcome to Microblog CMS. This is the About Me page.' WHERE slug = 'about'`,
    );
  }
}
