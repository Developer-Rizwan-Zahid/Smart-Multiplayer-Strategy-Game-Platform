using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStrategyGame.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGameTypeToGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GameType",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "Strategy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GameType",
                table: "Games");
        }
    }
}
